import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Droplet, HeartHandshake, Bot, ChevronLeft } from 'lucide-react';
import { GEMINI_API_KEY } from './config';

// Utility functions
const withRetry = async (fn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
};

const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const getFromLocalStorage = (key, defaultValue = null) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
};

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(dataUrl.split(',')[1]);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const callGeminiApi = async (base64Image, userPrompt, responseSchema, systemPrompt) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-gemini-api-key-here") {
        throw new Error("Please set your Gemini API key in src/config.js");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
        contents: [{
            role: "user",
            parts: [
                { text: userPrompt },
                { inlineData: { mimeType: "image/jpeg", data: base64Image } }
            ]
        }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    if (responseSchema) {
        payload.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        };
    }

    const fetchRequest = async () => {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
        }

        const result = await response.json();
        const textPart = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textPart) throw new Error("API response was missing expected content.");

        return responseSchema ? JSON.parse(textPart) : textPart;
    };

    return withRetry(fetchRequest);
};

export default function App() {
    const [plants, setPlants] = useState([]);
    const [currentView, setCurrentView] = useState('list');
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage
    useEffect(() => {
        const savedPlants = getFromLocalStorage('plants', []);
        setPlants(savedPlants);
        setIsLoading(false);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (!isLoading) saveToLocalStorage('plants', plants);
    }, [plants, isLoading]);

    const addPlant = (plantData) => {
        const newPlant = {
            id: generateId(),
            ...plantData,
            lastCheckIn: new Date().toISOString(),
            nextReminder: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        setPlants(prev => [...prev, newPlant]);
        
        // Save initial check-in
        const checkIns = getFromLocalStorage(`checkIns_${newPlant.id}`, []);
        checkIns.push({
            id: generateId(),
            date: new Date().toISOString(),
            imageBase64: plantData.initialImage,
            report: plantData.initialReport,
            tips: "Initial assessment completed",
            checkInType: "initial"
        });
        saveToLocalStorage(`checkIns_${newPlant.id}`, checkIns);
    };

    const addCheckIn = (plantId, checkInData) => {
        const checkIns = getFromLocalStorage(`checkIns_${plantId}`, []);
        checkIns.push({
            id: generateId(),
            date: new Date().toISOString(),
            ...checkInData
        });
        saveToLocalStorage(`checkIns_${plantId}`, checkIns);

        // Update plant
        setPlants(prev => prev.map(plant => 
            plant.id === plantId ? {
                ...plant,
                lastCheckIn: new Date().toISOString(),
                nextReminder: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            } : plant
        ));
    };

    const PlantCard = ({ plant }) => {
        const nextReminderDate = new Date(plant.nextReminder);
        const needsAttention = nextReminderDate <= new Date();

        return (
            <div className="bg-white p-4 rounded-xl shadow-lg border border-green-100 hover:shadow-xl hover:border-green-300 transition">
                <h3 className="text-xl font-bold text-green-800 mb-1">{plant.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{plant.speciesInfo?.speciesName || 'Species Unknown'}</p>
                
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                            <HeartHandshake className="w-4 h-4 mr-1" /> Last Check-in:
                        </span>
                        <span>{new Date(plant.lastCheckIn).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="flex items-center text-gray-600">
                            <Droplet className="w-4 h-4 mr-1" /> Next Reminder:
                        </span>
                        <span className={needsAttention ? 'text-red-600 font-bold' : 'text-green-600'}>
                            {nextReminderDate.toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {needsAttention && (
                    <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg mb-2 text-center font-medium">
                        Time to water and check-in!
                    </p>
                )}

                <div className="flex space-x-2">
                    <button
                        onClick={() => { setSelectedPlant(plant); setCurrentView('details'); }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-xl transition text-sm"
                    >
                        View Details
                    </button>
                    <button
                        onClick={() => { setSelectedPlant(plant); setCurrentView('checkin'); }}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-xl transition text-sm"
                    >
                        Check-in
                    </button>
                </div>
            </div>
        );
    };

    const PlantList = () => (
        <div className="p-4 sm:p-8">
            <h1 className="text-3xl font-extrabold text-green-900 mb-6">Your Plant Garden</h1>
            
            <button
                onClick={() => setCurrentView('add')}
                className="w-full mb-8 flex items-center justify-center p-4 bg-lime-600 text-white rounded-xl shadow-lg hover:bg-lime-700 transition font-bold text-lg"
            >
                <Plus className="w-5 h-5 mr-2" /> Add a New Plant
            </button>

            {plants.length === 0 ? (
                <div className="text-center p-10 bg-green-50 rounded-xl border border-dashed border-green-300">
                    <p className="text-gray-600 text-lg">You haven't added any plants yet!</p>
                    <p className="text-gray-400 text-sm mt-1">Click the button above to start tracking your first plant.</p>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-green-700 text-sm font-medium">✅ Ready to track your plants!</p>
                        <p className="text-green-600 text-xs">Data is saved locally in your browser</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plants.map(plant => <PlantCard key={plant.id} plant={plant} />)}
                </div>
            )}
        </div>
    );

    const AddPlantView = () => {
        const [plantName, setPlantName] = useState('');
        const [imageFile, setImageFile] = useState(null);
        const [previewUrl, setPreviewUrl] = useState(null);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);

        const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setImageFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!plantName || !imageFile) {
                setError("Please provide a name and image for your plant.");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const base64Image = await fileToBase64(imageFile);
                let speciesInfo = { 
                    speciesName: "Unknown Species", 
                    scientificName: "Unknown", 
                    basicCareSummary: "Water regularly and provide adequate light." 
                };
                let initialReport = "Plant added successfully! Start tracking its progress with regular check-ins.";

                // Try AI analysis if API key available
                if (GEMINI_API_KEY && GEMINI_API_KEY !== "your-gemini-api-key-here") {
                    try {
                        const speciesSchema = {
                            type: "OBJECT",
                            properties: {
                                speciesName: { type: "STRING" },
                                scientificName: { type: "STRING" },
                                basicCareSummary: { type: "STRING" }
                            },
                            required: ["speciesName", "scientificName", "basicCareSummary"]
                        };

                        speciesInfo = await callGeminiApi(
                            base64Image,
                            "Identify this plant species. Provide the common name, scientific name, and basic care summary.",
                            speciesSchema,
                            "You are an expert botanist. Identify the plant and provide care information."
                        );

                        initialReport = await callGeminiApi(
                            base64Image,
                            `This is my plant named ${plantName}. Give an initial assessment and care tip.`,
                            null,
                            "You are a friendly plant care coach. Give encouraging advice."
                        );
                    } catch (aiError) {
                        console.log("AI analysis failed, using manual mode:", aiError.message);
                    }
                }

                addPlant({ name: plantName, speciesInfo, initialImage: base64Image, initialReport });
                setCurrentView('list');
                setPlantName('');
                setImageFile(null);
                setPreviewUrl(null);
            } catch (err) {
                setError(`Failed to save plant: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="p-4 sm:p-8">
                <button onClick={() => setCurrentView('list')} className="flex items-center text-green-700 hover:text-green-900 mb-6 font-medium">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Plants
                </button>
                <h1 className="text-3xl font-bold text-green-800 mb-6">Add New Plant</h1>

                <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-2xl border-t-4 border-lime-600">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plant Nickname</label>
                            <input
                                type="text"
                                value={plantName}
                                onChange={(e) => setPlantName(e.target.value)}
                                placeholder="e.g., Fernie or Sunny"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-lime-500 focus:border-lime-500"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plant Picture</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100"
                                disabled={loading}
                            />
                        </div>

                        {previewUrl && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                <img src={previewUrl} alt="Plant Preview" className="w-full max-h-64 object-cover rounded-lg shadow-md" />
                            </div>
                        )}

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-700 text-sm">
                                {GEMINI_API_KEY && GEMINI_API_KEY !== "your-gemini-api-key-here" 
                                    ? "🤖 AI analysis enabled - plant will be identified automatically!" 
                                    : "📝 Manual mode - you can still track your plant's progress!"}
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center p-3 font-bold text-white rounded-xl transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-lime-600 hover:bg-lime-700'}`}
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                'Add Plant & Start Tracking'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const CheckInView = () => {
        const [imageFile, setImageFile] = useState(null);
        const [previewUrl, setPreviewUrl] = useState(null);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);

        if (!selectedPlant) {
            setCurrentView('list');
            return null;
        }

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!imageFile) {
                setError("Please upload a new picture.");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const base64Image = await fileToBase64(imageFile);
                let progressReport = "Check-in completed successfully!";
                let careTips = "Continue with regular watering and care.";

                if (GEMINI_API_KEY && GEMINI_API_KEY !== "your-gemini-api-key-here") {
                    try {
                        const report = await callGeminiApi(
                            base64Image,
                            `Analyze my ${selectedPlant.name} plant's condition and provide a care tip.`,
                            null,
                            "You are a plant care coach. Analyze the plant and give friendly advice."
                        );
                        
                        const [reportPart, tipPart] = report.split(/Care Tip:|Tip:/i);
                        progressReport = reportPart?.trim() || report;
                        careTips = tipPart?.trim() || "Continue with good care!";
                    } catch (aiError) {
                        console.log("AI analysis failed:", aiError.message);
                    }
                }

                addCheckIn(selectedPlant.id, {
                    imageBase64: base64Image,
                    report: progressReport,
                    tips: careTips,
                    checkInType: "progress"
                });

                setCurrentView('details');
            } catch (err) {
                setError(`Check-in failed: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="p-4 sm:p-8">
                <button onClick={() => setCurrentView('list')} className="flex items-center text-green-700 hover:text-green-900 mb-6 font-medium">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Plants
                </button>
                <h1 className="text-3xl font-bold text-green-800 mb-2">Check-in: {selectedPlant.name}</h1>

                <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-2xl border-t-4 border-blue-600">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                                <Droplet className="w-5 h-5 mr-3 mt-1 text-blue-500" />
                                <div>
                                    <h3 className="font-bold">Care & Document</h3>
                                    <p className="text-sm">Water your plant, then take a photo to track progress.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Progress Picture</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setImageFile(file);
                                        setPreviewUrl(URL.createObjectURL(file));
                                    }
                                }}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                disabled={loading}
                                required
                            />
                        </div>

                        {previewUrl && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">New Photo:</p>
                                <img src={previewUrl} alt="Progress" className="w-full max-h-64 object-cover rounded-lg shadow-md" />
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !imageFile}
                            className={`w-full flex items-center justify-center p-3 font-bold text-white rounded-xl transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                'Submit Check-in'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const PlantDetailsView = () => {
        const [checkIns, setCheckIns] = useState([]);

        useEffect(() => {
            if (selectedPlant) {
                const plantCheckIns = getFromLocalStorage(`checkIns_${selectedPlant.id}`, []);
                setCheckIns(plantCheckIns.reverse());
            }
        }, [selectedPlant]);

        if (!selectedPlant) {
            setCurrentView('list');
            return null;
        }

        return (
            <div className="p-4 sm:p-8">
                <button onClick={() => setCurrentView('list')} className="flex items-center text-green-700 hover:text-green-900 mb-6 font-medium">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Plants
                </button>
                
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 bg-white p-6 rounded-xl shadow-2xl border-t-4 border-green-500">
                        <h1 className="text-3xl font-bold text-green-800 mb-2">{selectedPlant.name}</h1>
                        <p className="text-lg text-gray-500 mb-4">{selectedPlant.speciesInfo?.scientificName}</p>

                        <div className="space-y-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <h3 className="font-semibold text-green-700 flex items-center mb-1">
                                    <Bot className="w-4 h-4 mr-2" />
                                    {selectedPlant.speciesInfo?.speciesName}
                                </h3>
                                <p className="text-sm text-gray-600">{selectedPlant.speciesInfo?.basicCareSummary}</p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <h3 className="font-semibold text-yellow-700 flex items-center mb-1">
                                    <Droplet className="w-4 h-4 mr-2" /> Last Check-in
                                </h3>
                                <p className="text-sm">{new Date(selectedPlant.lastCheckIn).toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold text-blue-700 flex items-center mb-1">
                                    <HeartHandshake className="w-4 h-4 mr-2" /> Next Reminder
                                </h3>
                                <p className="text-sm font-bold">{new Date(selectedPlant.nextReminder).toLocaleDateString()}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-purple-700 text-sm">💾 Your data is secure</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:w-2/3">
                        <h2 className="text-2xl font-bold text-green-800 mb-4">Progress History ({checkIns.length} entries)</h2>

                        {checkIns.length === 0 ? (
                            <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                                No check-in history found.
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {checkIns.map((checkIn, index) => (
                                    <div key={checkIn.id} className="bg-white p-5 rounded-xl shadow-md border-l-4 border-lime-500">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                            Check-in on {new Date(checkIn.date).toLocaleDateString()}
                                            {checkIn.checkInType === 'initial' && 
                                                <span className="ml-2 px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full">Initial</span>
                                            }
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-100 rounded-lg p-2">
                                                <p className="font-medium text-sm text-gray-700 mb-2">Plant Photo:</p>
                                                <img
                                                    src={`data:image/jpeg;base64,${checkIn.imageBase64}`}
                                                    alt={`Check-in ${index + 1}`}
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                                    <h4 className="font-bold text-indigo-700 flex items-center mb-1">
                                                        <Bot className="w-4 h-4 mr-2" /> Progress Report
                                                    </h4>
                                                    <p className="text-sm text-gray-800">{checkIn.report}</p>
                                                </div>

                                                {checkIn.checkInType === 'progress' && (
                                                    <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                                                        <h4 className="font-bold text-teal-700 flex items-center mb-1">
                                                            <Droplet className="w-4 h-4 mr-2" /> Care Tip
                                                        </h4>
                                                        <p className="text-sm text-gray-800">{checkIn.tips}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const MainContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
                    <Loader2 className="w-12 h-12 text-lime-600 animate-spin mb-4" />
                    <p className="text-lg text-gray-700">Loading your garden...</p>
                </div>
            );
        }

        switch (currentView) {
            case 'add': return <AddPlantView />;
            case 'checkin': return <CheckInView />;
            case 'details': return <PlantDetailsView />;
            default: return <PlantList />;
        }
    };

    return (
        <div className="min-h-screen bg-green-50 font-sans">
            <header className="bg-white shadow-md p-4 sticky top-0 z-10">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <h1 className="text-2xl font-black text-lime-700 flex items-center">
                        <span className="text-4xl mr-2">🌿</span>
                        Green Guardian
                    </h1>
                    <span className="text-xs text-gray-400">Plant Care Companion</span>
                </div>
            </header>
            <main className="max-w-6xl mx-auto py-8">
                <MainContent />
            </main>
        </div>
    );
}
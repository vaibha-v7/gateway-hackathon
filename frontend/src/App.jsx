import { useState } from "react";

function App() {

    const API_URL = (
        import.meta.env.VITE_API_URL || "http://localhost:5000"
    ).replace(/\/$/, "");

    const [messages, setMessages] = useState([""]);

    const [results, setResults] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [jsonInput, setJsonInput] = useState("");

    const [showJson, setShowJson] = useState(false);


    // --------------------------------
    // Manual message handling
    // --------------------------------

    const addMessage = () => {
        setMessages([
            ...messages,
            ""
        ]);
    };


    const updateMessage = (index, value) => {

        const updatedMessages = [...messages];

        updatedMessages[index] = value;

        setMessages(updatedMessages);
    };


    const removeMessage = (index) => {

        if (messages.length === 1) {
            return;
        }

        setMessages(
            messages.filter((_, i) => i !== index)
        );
    };


    // --------------------------------
    // Convert JSON into messages
    // --------------------------------

    const parseJSONMessages = (data) => {

        let extractedMessages = [];

        // ["message 1", "message 2"]

        if (Array.isArray(data)) {

            extractedMessages = data
                .map(item => {

                    if (typeof item === "string") {
                        return item;
                    }

                    if (
                        typeof item === "object" &&
                        item !== null &&
                        typeof item.message === "string"
                    ) {
                        return item.message;
                    }

                    return null;
                })
                .filter(Boolean);

        }

        // { messages: [...] }

        else if (
            data &&
            Array.isArray(data.messages)
        ) {

            extractedMessages = data.messages
                .map(item => {

                    if (typeof item === "string") {
                        return item;
                    }

                    if (
                        typeof item === "object" &&
                        item !== null &&
                        typeof item.message === "string"
                    ) {
                        return item.message;
                    }

                    return null;
                })
                .filter(Boolean);
        }

        return extractedMessages;
    };


    // --------------------------------
    // Apply JSON input
    // --------------------------------

    const loadJSONMessages = () => {

        setError("");

        if (!jsonInput.trim()) {

            setError("Please enter some JSON.");

            return;
        }

        try {

            const parsed = JSON.parse(jsonInput);

            const extractedMessages =
                parseJSONMessages(parsed);

            if (extractedMessages.length === 0) {

                setError(
                    "No valid messages found in the JSON."
                );

                return;
            }

            setMessages(extractedMessages);

            setResults([]);

            setJsonInput("");

            setShowJson(false);

        } catch (error) {

            setError(
                "Invalid JSON. Please check the format."
            );
        }
    };


    // --------------------------------
    // Upload JSON file
    // --------------------------------

    const handleJSONUpload = (event) => {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        setError("");

        if (!file.name.toLowerCase().endsWith(".json")) {

            setError("Please upload a .json file.");

            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {

            try {

                const parsed = JSON.parse(
                    e.target.result
                );

                const extractedMessages =
                    parseJSONMessages(parsed);

                if (extractedMessages.length === 0) {

                    setError(
                        "No valid messages found in the JSON file."
                    );

                    return;
                }

                setMessages(extractedMessages);

                setResults([]);

            } catch (error) {

                setError(
                    "The uploaded file contains invalid JSON."
                );
            }
        };

        reader.readAsText(file);

        event.target.value = "";
    };


    // --------------------------------
    // Analyze messages
    // --------------------------------

    const analyzeMessages = async () => {

        setError("");

        const validMessages = messages
            .map(message => message.trim())
            .filter(message => message !== "");


        if (validMessages.length === 0) {

            setError(
                "Please enter at least one message."
            );

            return;
        }


        setLoading(true);

        setResults([]);


        try {

            let response;


            // ----------------------------
            // Single message
            // ----------------------------

            if (validMessages.length === 1) {

                response = await fetch(
                    `${API_URL}/api/triage`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            message: validMessages[0]
                        })
                    }
                );


                const data = await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.error || "Triage failed"
                    );
                }


                setResults([data]);

            }


            // ----------------------------
            // Multiple messages
            // ----------------------------

            else {

                response = await fetch(
                    `${API_URL}/api/triage/batch`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            messages: validMessages
                        })
                    }
                );


                const data = await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Batch processing failed"
                    );
                }


                setResults(
                    data.results || []
                );
            }


        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Unable to connect to the backend."
            );

        } finally {

            setLoading(false);
        }
    };


    // --------------------------------
    // Clear everything
    // --------------------------------

    const clearAll = () => {

        setMessages([""]);

        setResults([]);

        setJsonInput("");

        setError("");
    };


    // --------------------------------
    // Statistics
    // --------------------------------

    const humanReviewResults =
        results.filter(
            result => result.needs_human
        );

    const autoResults =
        results.filter(
            result => !result.needs_human
        );


    return (

        <div className="min-h-screen bg-[#10161B] text-[#E7E2D3] font-mono">

            <div className="max-w-6xl mx-auto px-5 sm:px-6 py-10">


                {/* ============================= */}
                {/* HEADER */}
                {/* ============================= */}

                <div className="mb-10">

                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#D98E2B]">

                        <span className="w-2 h-2 rounded-full bg-[#C1432A] animate-pulse"></span>

                        Dispatch Log — Live

                    </div>


                    <h1 className="font-sans font-black text-5xl sm:text-6xl uppercase tracking-tighter mt-3 text-[#F5EFDD]">
                        Frontline
                    </h1>


                    <p className="text-[#8A9199] mt-2 text-sm tracking-wide">
                        // message intake &amp; automated routing
                    </p>

                </div>


                {/* ============================= */}
                {/* CONSOLE (INPUT) */}
                {/* ============================= */}

                <div className="bg-[#1A2229] border border-[#2E3944] rounded-md p-5 sm:p-7">


                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-[#2E3944]">

                        <div>

                            <h2 className="text-lg font-bold uppercase tracking-wide text-[#F5EFDD]">
                                Message Queue
                            </h2>

                            <p className="text-sm text-[#8A9199] mt-1">
                                Enter one message, or several, for triage.
                            </p>

                        </div>


                        <span className="text-xs uppercase tracking-widest text-[#D98E2B] border border-[#D98E2B]/40 rounded-sm px-2 py-1 w-fit">
                            queue: {String(messages.length).padStart(2, "0")}
                        </span>

                    </div>


                    {/* Message inputs */}

                    <div className="space-y-3">

                        {messages.map((message, index) => (

                            <div
                                key={index}
                                className="flex gap-3"
                            >

                                <div className="flex-1 relative">

                                    <textarea
                                        value={message}
                                        onChange={(e) =>
                                            updateMessage(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        placeholder={`Enter customer message ${index + 1}...`}
                                        rows="2"
                                        className="w-full bg-[#10161B] border border-[#2E3944] rounded-sm px-4 py-3 pr-16 outline-none focus:border-[#D98E2B] focus:ring-1 focus:ring-[#D98E2B]/30 resize-none transition text-[#E7E2D3] placeholder:text-[#5A6169] text-sm"
                                    />

                                    <span className="absolute right-3 bottom-3 text-[10px] uppercase tracking-widest text-[#5A6169]">
                                        msg-{String(index + 1).padStart(2, "0")}
                                    </span>

                                </div>


                                {messages.length > 1 && (

                                    <button
                                        onClick={() =>
                                            removeMessage(index)
                                        }
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#5A6169]/30 bg-[#2A2F36] text-lg font-semibold text-[#5A6169] transition hover:border-[#C1432A]/50 hover:bg-[#C1432A]/15 hover:text-[#FF6B4A]"
                                        title="Remove message"
                                    >
                                        ×
                                    </button>

                                )}

                            </div>

                        ))}

                    </div>


                    {/* Add message */}

                    <button
                        onClick={addMessage}
                        disabled={loading}
                        className="mt-5 inline-flex items-center justify-center rounded-xl border border-[#F0A93E]/40 bg-[#D98E2B]/15 px-4 py-3 text-sm font-semibold text-[#F7C56A] shadow-[0_0_0_1px_rgba(240,169,62,0.15),0_10px_25px_rgba(217,142,43,0.2)] transition hover:-translate-y-0.5 hover:bg-[#D98E2B]/25 hover:text-[#FFD27A] hover:shadow-[0_0_0_1px_rgba(240,169,62,0.25),0_14px_30px_rgba(217,142,43,0.28)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span className="mr-2 text-base">[+]</span>
                        queue another message
                    </button>


                    {/* Buttons */}

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">

                        <button
                            onClick={analyzeMessages}
                            disabled={loading}
                            className="flex-1 bg-[#D98E2B] hover:bg-[#F0A93E] disabled:opacity-50 disabled:cursor-not-allowed rounded-sm py-3 font-bold uppercase tracking-wide text-[#10161B] transition"
                        >

                            {loading
                                ? `Running triage on ${messages.filter(
                                    message =>
                                        message.trim() !== ""
                                ).length}...`
                                : "Run Triage ▶"
                            }

                        </button>


                        <button
                            onClick={clearAll}
                            disabled={loading}
                            className="sm:w-36 border border-[#2E3944] hover:border-[#5A6169] rounded-sm py-3 text-[#8A9199] hover:text-[#E7E2D3] uppercase tracking-wide text-sm transition disabled:opacity-40"
                        >
                            Reset Log
                        </button>

                    </div>


                    {/* ============================= */}
                    {/* JSON OPTIONS */}
                    {/* ============================= */}

                    <div className="mt-7 pt-6 border-t border-[#2E3944]">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                            <div>

                                <p className="font-bold uppercase tracking-wide text-sm text-[#F5EFDD]">
                                    Bulk Intake
                                </p>

                                <p className="text-sm text-[#8A9199] mt-1">
                                    Upload or paste raw JSON containing customer messages.
                                </p>

                            </div>


                            <div className="flex gap-2">

                                <label className="cursor-pointer border border-[#2E3944] hover:border-[#5A6169] rounded-sm px-4 py-2 text-sm text-[#E7E2D3] transition">

                                    Upload JSON

                                    <input
                                        type="file"
                                        accept=".json,application/json"
                                        onChange={handleJSONUpload}
                                        className="hidden"
                                    />

                                </label>


                                <button
                                    onClick={() =>
                                        setShowJson(!showJson)
                                    }
                                    className="border border-[#2E3944] hover:border-[#5A6169] rounded-sm px-4 py-2 text-sm text-[#E7E2D3] transition"
                                >
                                    {showJson
                                        ? "Hide JSON"
                                        : "Paste JSON"
                                    }
                                </button>

                            </div>

                        </div>


                        {showJson && (

                            <div className="mt-4">

                                <textarea
                                    value={jsonInput}
                                    onChange={(e) =>
                                        setJsonInput(e.target.value)
                                    }
                                    placeholder={`[
  "I was charged twice",
  "Where is my order?",
  "The website is not working"
]`}
                                    rows="8"
                                    className="w-full bg-[#10161B] border border-[#2E3944] rounded-sm px-4 py-3 font-mono text-sm text-[#E7E2D3] outline-none focus:border-[#D98E2B] resize-y placeholder:text-[#5A6169]"
                                />


                                <button
                                    onClick={loadJSONMessages}
                                    className="mt-3 bg-[#2E3944] hover:bg-[#3A4550] border border-[#2E3944] rounded-sm px-4 py-2 text-sm uppercase tracking-wide transition"
                                >
                                    Load JSON Messages
                                </button>

                            </div>

                        )}

                    </div>


                    {/* Error */}

                    {error && (

                        <div className="mt-5 rounded-sm border border-[#C1432A]/50 bg-[#C1432A]/10 px-4 py-3 text-sm text-[#E8917C]">
                            <span className="font-bold uppercase tracking-wide mr-2">Error:</span>
                            {error}
                        </div>

                    )}

                </div>


                {/* ============================= */}
                {/* RESULTS */}
                {/* ============================= */}

                {results.length > 0 && (

                    <div className="mt-10">


                        <div className="mb-5">

                            <h2 className="text-lg font-bold uppercase tracking-wide text-[#F5EFDD]">
                                Ticket Queue
                            </h2>

                            <p className="text-sm text-[#8A9199] mt-1">
                                Classification and routing decisions
                            </p>

                        </div>


                        {/* Statistics */}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">

                            <div className="bg-[#1A2229] border border-[#2E3944] rounded-sm p-4">

                                <p className="text-xs uppercase tracking-widest text-[#8A9199]">
                                    Total Messages
                                </p>

                                <p className="text-3xl font-bold mt-1 text-[#F5EFDD]">
                                    {results.length}
                                </p>

                            </div>


                            <div className="bg-[#1A2229] border border-[#3F8F7A]/30 rounded-sm p-4">

                                <p className="text-xs uppercase tracking-widest text-[#8A9199]">
                                    Auto Cleared
                                </p>

                                <p className="text-3xl font-bold text-[#3F8F7A] mt-1">
                                    {autoResults.length}
                                </p>

                            </div>


                            <div className="bg-[#1A2229] border border-[#C1432A]/40 rounded-sm p-4">

                                <p className="text-xs uppercase tracking-widest text-[#8A9199]">
                                    Flagged
                                </p>

                                <p className="text-3xl font-bold text-[#C1432A] mt-1">
                                    {humanReviewResults.length}
                                </p>

                            </div>

                        </div>


                        {/* ============================= */}
                        {/* HUMAN REVIEW */}
                        {/* ============================= */}

                        {humanReviewResults.length > 0 && (

                            <div className="mb-10">

                                <div className="h-2 w-full mb-4 rounded-sm bg-[repeating-linear-gradient(45deg,#C1432A_0px,#C1432A_10px,#D98E2B_10px,#D98E2B_20px)] opacity-80"></div>

                                <h3 className="text-base font-bold uppercase tracking-widest text-[#C1432A] mb-4">
                                    ⚠ Flagged — Human Review Required
                                </h3>


                                <div className="space-y-5">

                                    {humanReviewResults.map(
                                        (result, index) => (

                                            <div
                                                key={index}
                                                className="relative bg-[#F5EFDD] text-[#1E2530] rounded-sm shadow-lg overflow-hidden border-2 border-[#C1432A]"
                                            >

                                                {/* hazard stripe */}
                                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[repeating-linear-gradient(45deg,#C1432A_0px,#C1432A_6px,#F5EFDD_6px,#F5EFDD_12px)]"></div>

                                                {/* perforation */}
                                                <div className="h-3 relative">
                                                    <div className="absolute inset-x-0 top-0 h-3 bg-[radial-gradient(circle_at_center,#10161B_2.5px,transparent_2.6px)] bg-[length:16px_100%]"></div>
                                                </div>

                                                <div className="pl-6 pr-5 pb-5">

                                                    <div className="flex items-start justify-between gap-4">

                                                        <span className="text-[11px] uppercase tracking-widest text-[#8A7A5A]">
                                                            Ticket T-{String(index + 1).padStart(3, "0")}
                                                        </span>

                                                        <span className="-rotate-6 border-2 border-[#C1432A] text-[#C1432A] font-bold uppercase text-xs px-3 py-1 rounded-sm tracking-widest">
                                                            Flagged
                                                        </span>

                                                    </div>


                                                    <p className="text-[#1E2530] leading-relaxed mt-2 text-base">
                                                        {result.message}
                                                    </p>


                                                    <div className="flex flex-wrap gap-2 mt-4">

                                                        <span className="rounded-sm bg-[#1E2530]/5 border border-[#1E2530]/20 px-3 py-1 text-xs uppercase tracking-wide">
                                                            {result.category}
                                                        </span>


                                                        <span className="rounded-sm bg-[#1E2530]/5 border border-[#1E2530]/20 px-3 py-1 text-xs uppercase tracking-wide">
                                                            {result.priority}
                                                        </span>


                                                        <span className="rounded-sm bg-[#C1432A]/10 border border-[#C1432A]/30 px-3 py-1 text-xs text-[#C1432A] font-semibold">
                                                            {Math.round(
                                                                result.confidence * 100
                                                            )}% confidence
                                                        </span>

                                                    </div>


                                                    <div className="mt-4 bg-[#FFE58A] rounded-sm px-4 py-3">

                                                        <p className="text-[10px] uppercase tracking-widest text-[#8A7A5A] font-bold mb-1">
                                                            Summary
                                                        </p>

                                                        <p className="text-base sm:text-lg font-semibold text-[#1E2530] leading-snug">
                                                            {result.summary}
                                                        </p>

                                                    </div>


                                                    <div className="mt-3 bg-[#1E2530] rounded-sm px-4 py-3">

                                                        <p className="text-[10px] uppercase tracking-widest text-[#D98E2B] font-bold mb-1">
                                                            Next Action
                                                        </p>

                                                        <p className="text-base sm:text-lg font-semibold text-[#F5EFDD] leading-snug">
                                                            {result.suggested_action}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                        {/* ============================= */}
                        {/* AUTO PROCESSED */}
                        {/* ============================= */}

                        {autoResults.length > 0 && (

                            <div>

                                <div className="h-px w-full mb-4 bg-[#2E3944]"></div>

                                <h3 className="text-sm font-bold uppercase tracking-widest text-[#8A9199] mb-4">
                                    Auto Cleared
                                </h3>


                                <div className="space-y-4">

                                    {autoResults.map(
                                        (result, index) => (

                                            <div
                                                key={index}
                                                className="relative bg-[#F5EFDD]/95 text-[#1E2530] rounded-sm overflow-hidden border border-[#2E3944]/30"
                                            >

                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3F8F7A]"></div>

                                                <div className="h-2 relative">
                                                    <div className="absolute inset-x-0 top-0 h-2 bg-[radial-gradient(circle_at_center,#10161B_2px,transparent_2.1px)] bg-[length:14px_100%]"></div>
                                                </div>

                                                <div className="pl-5 pr-5 pb-4">

                                                    <div className="flex items-start justify-between gap-4">

                                                        <span className="text-[11px] uppercase tracking-widest text-[#8A7A5A]">
                                                            Ticket T-{String(index + 1).padStart(3, "0")}
                                                        </span>

                                                        <span className="-rotate-3 border border-[#3F8F7A] text-[#3F8F7A] font-bold uppercase text-[10px] px-2 py-0.5 rounded-sm tracking-widest">
                                                            Cleared
                                                        </span>

                                                    </div>


                                                    <p className="leading-relaxed mt-2 text-sm">
                                                        {result.message}
                                                    </p>


                                                    <div className="flex flex-wrap gap-2 mt-3">

                                                        <span className="rounded-sm bg-[#1E2530]/5 border border-[#1E2530]/15 px-2.5 py-0.5 text-[11px] uppercase tracking-wide">
                                                            {result.category}
                                                        </span>


                                                        <span className="rounded-sm bg-[#1E2530]/5 border border-[#1E2530]/15 px-2.5 py-0.5 text-[11px] uppercase tracking-wide">
                                                            {result.priority}
                                                        </span>


                                                        <span className="rounded-sm bg-[#3F8F7A]/10 border border-[#3F8F7A]/30 px-2.5 py-0.5 text-[11px] text-[#3F8F7A] font-semibold">
                                                            {Math.round(
                                                                result.confidence * 100
                                                            )}% confidence
                                                        </span>

                                                    </div>


                                                    <div className="mt-3 bg-[#FFE58A]/70 rounded-sm px-3 py-2">

                                                        <p className="text-[10px] uppercase tracking-widest text-[#8A7A5A] font-bold mb-0.5">
                                                            Summary
                                                        </p>

                                                        <p className="text-sm sm:text-base font-semibold text-[#1E2530] leading-snug">
                                                            {result.summary}
                                                        </p>

                                                    </div>


                                                    <div className="mt-2 bg-[#1E2530] rounded-sm px-3 py-2">

                                                        <p className="text-[10px] uppercase tracking-widest text-[#3F8F7A] font-bold mb-0.5">
                                                            Next Action
                                                        </p>

                                                        <p className="text-sm sm:text-base font-semibold text-[#F5EFDD] leading-snug">
                                                            {result.suggested_action}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}

                    </div>

                )}


                {/* Footer */}

                <div className="text-center text-[11px] uppercase tracking-widest text-[#3E464D] mt-12 pb-5">
                    Frontline — dispatch &amp; triage log
                </div>

            </div>

        </div>
    );
}

export default App;
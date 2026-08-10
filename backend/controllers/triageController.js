const triageMessage = require("../services/triageService");

const triageSingle = async (req, res) => {

    try {

        const { message } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({
                error: "Customer message is required"
            });
        }

        const result = await triageMessage(message);

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal server error"
        });

    }

};


const triageBatch = async (req, res) => {

    try {

        const { messages } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Messages array is required"
            });
        }

        const results = [];

        for (const message of messages) {

            const result = await triageMessage(message);

            results.push({
                message: message,
                ...result
            });

        }

        res.json({
            count: results.length,
            results: results
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Batch processing failed(Quota exceeded)"
        });

    }

};


module.exports = {
    triageSingle,
    triageBatch
};
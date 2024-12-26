const functions = require("../structure/functions.js");

module.exports = async (ws) => {
    // create hashes
    const ticketId = functions.MakeID().replace(/-/ig, "");
    const matchId = functions.MakeID().replace(/-/ig, "");
    const sessionId = functions.MakeID().replace(/-/ig, "");

    let totalPlayers = 1; // Track total players
    let connectedPlayers = 1; // Track connected players
    let estimatedWaitSec = 15; // Estimated wait time in seconds

    // Function to send status updates
    function sendStatusUpdate(state, additionalPayload = {}) {
        const payload = {
            "state": state,
            "totalPlayers": totalPlayers,
            "connectedPlayers": connectedPlayers,
            ...additionalPayload
        };
        ws.send(JSON.stringify({
            "payload": payload,
            "name": "StatusUpdate"
        }));
    }

    // Connecting phase
    function Connecting() {
        sendStatusUpdate("Connecting");
        totalPlayers++;
        connectedPlayers++;
    }

    // Waiting phase
    function Waiting() {
        sendStatusUpdate("Waiting");
    }

    // Queued phase
    function Queued() {
        // Calculate estimated wait time based on queued players
        estimatedWaitSec = Math.max(0, (totalPlayers - connectedPlayers) * 10); // Example: 10 seconds per player in the queue

        sendStatusUpdate("Queued", {
            "ticketId": ticketId,
            "queuedPlayers": Math.max(0, totalPlayers - connectedPlayers),
            "estimatedWaitSec": estimatedWaitSec
        });
    }

    // Session assignment phase
    function SessionAssignment() {
        sendStatusUpdate("SessionAssignment", {
            "matchId": matchId
        });
    }

    // Join phase
    function Join() {
        ws.send(JSON.stringify({
            "payload": {
                "matchId": matchId,
                "sessionId": sessionId,
                "joinDelaySec": 1
            },
            "name": "Play"
        }));
        // Simulate a player joining the game
        connectedPlayers = Math.max(0, connectedPlayers - 1); // Ensure connectedPlayers doesn't go below 0
    }

    // Run through the phases with delays
    Connecting();
    await functions.sleep(800); // Connecting phase delay
    Waiting();
    await functions.sleep(1000); // Waiting phase delay
    Queued();
    await functions.sleep(4000); // Queued phase delay
    SessionAssignment();
    await functions.sleep(2000); // Session Assignment delay
    Join();
};

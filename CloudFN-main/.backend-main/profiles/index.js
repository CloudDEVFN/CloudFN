const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Load the Athena template
let athena = require("./athena_template.json");

// Fixed backend values mapping
const fixedBackendValues = {
    "AthenaEmoji": "AthenaDance",
    "AthenaSpray": "AthenaDance",
    "AthenaToy": "AthenaDance",
    "AthenaPetCarrier": "AthenaBackpack",
    "AthenaPet": "AthenaBackpack",
    "SparksDrum": "SparksDrums",
    "SparksMic": "SparksMicrophone"
};

console.log("CloudFN Generator\n");

// Fetch cosmetics data from the API
axios
    .get("https://fortnite-api.com/v2/cosmetics")
    .then(response => {
        const data = response.data?.data;

        if (!data) {
            console.error("[ERROR] No data received from the API.");
            return;
        }

        console.log("[GEN] Starting to generate...\n");

        // Process each mode in the data
        for (const mode in data) {
            if (mode === "lego") continue; // Skip "lego" mode

            data[mode].forEach(item => {
                if (!item || typeof item.id !== "string") return; // Ensure item and item.id exist
            
                // Skip items with "random" in their ID
                if (item.id.toLowerCase().includes("random")) return;
            
                // Fix backendValue for specific modes
                if (mode === "tracks") {
                    item.type = { backendValue: "SparksSong" };
                }
            
                // Ensure item.type and item.type.backendValue exist before proceeding
                if (!item.type?.backendValue) {
                    console.warn(`[WARN] Skipping item with missing type or backendValue:`, item);
                    return;
                }
            
                // Apply fixed backend values if necessary
                if (fixedBackendValues[item.type.backendValue]) {
                    item.type.backendValue = fixedBackendValues[item.type.backendValue];
                }
            
                // Generate item ID
                const id = `${item.type.backendValue}:${item.id}`;
                const variants = [];
            
                // Process item variants
                if (Array.isArray(item.variants)) {
                    item.variants.forEach(variant => {
                        variants.push({
                            channel: variant.channel || "",
                            active: variant.options?.[0]?.tag || "",
                            owned: variant.options?.map(option => option.tag || []) || []
                        });
                    });
                }
            
                // Add the processed item to the Athena profile
                athena.items[id] = {
                    templateId: id,
                    attributes: {
                        max_level_bonus: 0,
                        level: 1,
                        item_seen: true,
                        xp: 0,
                        variants,
                        favorite: false
                    },
                    quantity: 1
                };
            });            
        }

        // Write the updated Athena profile to a file
        const outputFilePath = path.join(__dirname, "athena.json");
        fs.writeFileSync(outputFilePath, JSON.stringify(athena, null, 2));

        // Get the file size and log success
        const stats = fs.statSync(outputFilePath);
        console.log(
            "[GEN] Successfully generated and saved to",
            outputFilePath,
            `(${formatSize(stats.size)})`
        );
    })
    .catch(error => {
        console.error("[ERROR] Failed to fetch data or process items:", error.message);
    });

/**
 * Format file size in a readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
function formatSize(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "N/A";

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return i === 0
        ? `${bytes} ${sizes[i]}`
        : `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

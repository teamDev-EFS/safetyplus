import fs from "fs";
import path from "path";

// Sync team images from backend to frontend public directory
function syncTeamImages() {
  try {
    const backendTeamDir = path.join(
      process.cwd(),
      "backend",
      "uploads",
      "team"
    );
    const frontendTeamDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "team"
    );

    // Create frontend directory if it doesn't exist
    if (!fs.existsSync(frontendTeamDir)) {
      fs.mkdirSync(frontendTeamDir, { recursive: true });
      console.log("✓ Created frontend team directory");
    }

    // Check if backend directory exists
    if (!fs.existsSync(backendTeamDir)) {
      console.log("⚠ Backend team directory does not exist");
      return;
    }

    // Get all files from backend team directory
    const backendFiles = fs.readdirSync(backendTeamDir);
    console.log(`Found ${backendFiles.length} files in backend team directory`);

    // Copy each file to frontend directory
    let copiedCount = 0;
    for (const file of backendFiles) {
      const backendPath = path.join(backendTeamDir, file);
      const frontendPath = path.join(frontendTeamDir, file);

      // Copy file if it doesn't exist in frontend or if backend is newer
      if (
        !fs.existsSync(frontendPath) ||
        fs.statSync(backendPath).mtime > fs.statSync(frontendPath).mtime
      ) {
        fs.copyFileSync(backendPath, frontendPath);
        copiedCount++;
        console.log(`✓ Copied ${file}`);
      }
    }

    console.log(`\n✓ Sync complete: ${copiedCount} files copied`);
  } catch (error) {
    console.error("Sync error:", error);
  }
}

// Run sync if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncTeamImages();
}

export { syncTeamImages };

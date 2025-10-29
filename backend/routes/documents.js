import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

// Mock documents data - in production, this would come from a database
const documents = [
  {
    id: "1",
    name: "Fire Protection Brochure",
    category: "Fire Protection",
    description:
      "Comprehensive guide to fire protection equipment and safety measures",
    filePath: "/uploads/documents/fire-protection-brochure.pdf",
    fileSize: "2.4 MB",
    uploadDate: "2024-01-15",
    type: "PDF",
  },
  {
    id: "2",
    name: "PPE Safety Brochure",
    category: "Personal Protective Equipment",
    description:
      "Complete overview of personal protective equipment and usage guidelines",
    filePath: "/uploads/documents/ppe-brochure.pdf",
    fileSize: "1.8 MB",
    uploadDate: "2024-01-10",
    type: "PDF",
  },
  {
    id: "3",
    name: "Road Safety Guide",
    category: "Road Safety",
    description:
      "Essential road safety equipment and traffic management solutions",
    filePath: "/uploads/documents/road-safety-brochure.pdf",
    fileSize: "3.1 MB",
    uploadDate: "2024-01-08",
    type: "PDF",
  },
  {
    id: "4",
    name: "Safety Signage Catalog",
    category: "Safety Signage",
    description:
      "Complete range of safety signs, labels, and visual communication tools",
    filePath: "/uploads/documents/safety-signage-brochure.pdf",
    fileSize: "2.7 MB",
    uploadDate: "2024-01-05",
    type: "PDF",
  },
];

// GET /api/documents - Get all documents
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;

    let filteredDocuments = [...documents];

    // Filter by category
    if (category && category !== "all") {
      filteredDocuments = filteredDocuments.filter(
        (doc) => doc.category === category
      );
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDocuments = filteredDocuments.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchLower) ||
          doc.description.toLowerCase().includes(searchLower) ||
          doc.category.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      documents: filteredDocuments,
      total: filteredDocuments.length,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
});

// GET /api/documents/categories - Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = Array.from(
      new Set(documents.map((doc) => doc.category))
    );
    res.json({
      success: true,
      categories: ["all", ...categories],
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

// GET /api/documents/:id - Get specific document
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const document = documents.find((doc) => doc.id === id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch document",
    });
  }
});

// GET /api/documents/download/:id - Download document
router.get("/download/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const document = documents.find((doc) => doc.id === id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      "documents",
      path.basename(document.filePath)
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    // Set headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.name}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    // Send file directly
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({
          success: false,
          message: "Failed to send file",
        });
      }
    });
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download document",
    });
  }
});

export default router;

import express from "express";
import { upload, uploadController, uploadMultipleController, deleteFileController } from "../controllers/uploadController";
import { authenticateToken } from "../middleware/auth";
import path from "path";
import multer from "multer";

const uploadRouter = express.Router();

// Middleware para servir arquivos estáticos
const uploadPath = path.resolve(__dirname, "../../../upload");
uploadRouter.use('/files', express.static(uploadPath));

// Rotas de upload
uploadRouter.post("/single", authenticateToken, upload.single("file"), uploadController);
uploadRouter.post("/multiple", authenticateToken, upload.array("files", 5), uploadMultipleController);

// Rota para deletar arquivo
uploadRouter.delete("/file/:filename", authenticateToken, deleteFileController);

// Middleware de tratamento de erros do multer
uploadRouter.use((error: unknown, _req: express.Request, res: express.Response) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "Arquivo muito grande. Tamanho máximo: 10MB"
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: "Muitos arquivos. Máximo: 5 arquivos"
      });
    }
  }

  // Type guard para acessar .message
  const message = (typeof error === "object" && error && "message" in error)
    ? (error as { message?: string }).message
    : "Erro no upload";

  res.status(400).json({
    success: false,
    message
  });
});

export default uploadRouter;
import { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";

import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

// Diretório base de uploads - usando caminho absoluto
const uploadPath = path.resolve(process.cwd(), "uploads");

// Tipos permitidos
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Criação do diretório, se não existir
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = '';
    if (allowedImageTypes.includes(file.mimetype)) {
      subDir = 'images';
    } else if (allowedDocumentTypes.includes(file.mimetype)) {
      subDir = 'documents';
    } else {
      subDir = 'others';
    }

    const finalPath = path.join(uploadPath, subDir);
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath, { recursive: true });
    }

    cb(null, finalPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de arquivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log("Arquivo rejeitado:", file.originalname, "tipo:", file.mimetype)
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
  }
};

// Exportar instância do multer configurada
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  }
});

// Controller para upload único
export const uploadController = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file as Express.Multer.File;

    if (!file) {
      res.status(400).json({ success: false, message: "Nenhum arquivo enviado." });
      return;
    }

    if (!fs.existsSync(file.path)) {
      res.status(500).json({ success: false, message: "Erro ao salvar arquivo no sistema." });
      return;
    }

    await new Promise<void>((resolve, reject) => {
      fs.chmod(file.path, 0o644, (err) => err ? reject(err) : resolve());
    });

    const stats = fs.statSync(file.path);
    const relativePath = path.relative(uploadPath, file.path);

    res.status(200).json({
      success: true,
      message: "Arquivo enviado com sucesso!",
      file: {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: stats.size,
        path: relativePath.replace(/\\/g, '/'),
        uploadDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Erro no upload:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ success: false, message: "Erro interno do servidor ao processar upload." });
  }
};

// Controller para múltiplos uploads
export const uploadMultipleController = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: "Nenhum arquivo enviado." });
      return;
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of files) {
      try {
        if (!fs.existsSync(file.path)) {
          errors.push({ file: file.originalname, error: "Arquivo não foi salvo" });
          continue;
        }

        await new Promise<void>((resolve, reject) => {
          fs.chmod(file.path, 0o644, (err) => err ? reject(err) : resolve());
        });

        const stats = fs.statSync(file.path);
        const relativePath = path.relative(uploadPath, file.path);

        uploadedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: stats.size,
          path: relativePath.replace(/\\/g, '/'),
          uploadDate: new Date().toISOString()
        });

      } catch (error) {
        console.error(`Erro ao processar arquivo ${file.originalname}:`, error);
        errors.push({ file: file.originalname, error: "Erro ao processar arquivo" });

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso!`,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("Erro no upload múltiplo:", error);

    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({ success: false, message: "Erro interno do servidor ao processar uploads." });
  }
};

// Controller para deletar arquivos
export const deleteFileController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;

    if (!filename) {
      res.status(400).json({ success: false, message: "Nome do arquivo é obrigatório." });
      return;
    }

    const searchDirs = ['images', 'documents', 'others'];
    let filePath = '';
    let found = false;

    for (const dir of searchDirs) {
      const testPath = path.join(uploadPath, dir, filename);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        found = true;
        break;
      }
    }

    if (!found) {
      res.status(404).json({ success: false, message: "Arquivo não encontrado." });
      return;
    }

    fs.unlinkSync(filePath);

    res.status(200).json({ success: true, message: "Arquivo deletado com sucesso!" });

  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    res.status(500).json({ success: false, message: "Erro interno do servidor ao deletar arquivo." });
  }
};

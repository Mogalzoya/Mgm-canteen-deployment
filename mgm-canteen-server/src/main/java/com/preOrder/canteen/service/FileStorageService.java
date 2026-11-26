package com.preOrder.canteen.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.preOrder.canteen.exception.BadRequestException;

@Service
public class FileStorageService {

    private static final long MAX_BYTES = 3L * 1024 * 1024;

    private final Path root;

    public FileStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create upload folder: " + root, e);
        }
    }

    public Path getRoot() {
        return root;
    }

    /** Saves an image and returns the public path, for example /uploads/3f2a....jpg */
    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please choose an image file");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("Image must be 3 MB or smaller");
        }

        String extension;
        try (InputStream in = file.getInputStream()) {
            extension = detectExtension(in.readNBytes(12));
        } catch (IOException e) {
            throw new BadRequestException("Could not read the image file");
        }
        if (extension == null) {
            throw new BadRequestException("Only JPG, PNG, WEBP or GIF images are allowed");
        }

        String fileName = UUID.randomUUID() + "." + extension;
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, root.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Could not save the image", e);
        }
        return "/uploads/" + fileName;
    }

    // The file type is decided from the file's own first bytes, not from its name or the
    // browser-supplied content type, so a renamed .html or .svg file cannot be uploaded.
    private String detectExtension(byte[] h) {
        if (h.length >= 3 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (h.length >= 4 && (h[0] & 0xFF) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G') {
            return "png";
        }
        if (h.length >= 4 && new String(h, 0, 4, StandardCharsets.US_ASCII).equals("GIF8")) {
            return "gif";
        }
        if (h.length >= 12
                && new String(h, 0, 4, StandardCharsets.US_ASCII).equals("RIFF")
                && new String(h, 8, 4, StandardCharsets.US_ASCII).equals("WEBP")) {
            return "webp";
        }
        return null;
    }
}

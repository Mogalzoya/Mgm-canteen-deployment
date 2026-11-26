package com.preOrder.canteen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.preOrder.canteen.entity.Food;
import com.preOrder.canteen.service.FileStorageService;
import com.preOrder.canteen.service.FoodService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/food")
public class FoodController {

    private final FoodService foodService;
    private final FileStorageService fileStorageService;

    public FoodController(FoodService foodService, FileStorageService fileStorageService) {
        this.foodService = foodService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping
    public Food addFood(@Valid @RequestBody Food food) {
        return foodService.addFood(food);
    }

    @PutMapping("/{id}")
    public Food updateFood(@PathVariable Long id, @Valid @RequestBody Food food) {
        return foodService.updateFood(id, food);
    }

    // Upload a food photo (admin only). Returns { "imageUrl": "/uploads/xxxx.jpg" }
    @PostMapping("/image")
    public Map<String, String> uploadImage(@RequestParam("file") MultipartFile file) {
        return Map.of("imageUrl", fileStorageService.storeImage(file));
    }

    @GetMapping
    public List<Food> getAllFood() {
        return foodService.getAllFood();
    }
}

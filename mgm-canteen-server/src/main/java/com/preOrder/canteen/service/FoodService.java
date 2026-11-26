package com.preOrder.canteen.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.preOrder.canteen.entity.Food;
import com.preOrder.canteen.exception.BadRequestException;
import com.preOrder.canteen.exception.ResourceNotFoundException;
import com.preOrder.canteen.repository.FoodRepository;

@Service
public class FoodService {

    private final FoodRepository foodRepository;

    public FoodService(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    public Food addFood(Food food) {
        food.setId(null);
        food.setImageUrl(cleanImageUrl(food.getImageUrl()));
        return foodRepository.save(food);
    }

    public Food updateFood(Long id, Food changes) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        food.setName(changes.getName());
        food.setDescription(changes.getDescription());
        food.setCategory(changes.getCategory());
        food.setPrice(changes.getPrice());
        food.setAvailable(changes.isAvailable());
        food.setImageUrl(cleanImageUrl(changes.getImageUrl()));
        return foodRepository.save(food);
    }

    public List<Food> getAllFood() {
        return foodRepository.findAll();
    }

    // Empty text means "no image". Only our own /uploads/ files or http(s) links are accepted.
    private String cleanImageUrl(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String clean = url.trim();
        boolean ok = clean.startsWith("/uploads/")
                || clean.startsWith("https://")
                || clean.startsWith("http://");
        if (!ok || clean.length() > 500) {
            throw new BadRequestException(
                    "Image must be an uploaded file or an http(s) link");
        }
        return clean;
    }
}

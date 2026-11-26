package com.preOrder.canteen.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.preOrder.canteen.dto.OrderItemRequestDto;
import com.preOrder.canteen.dto.OrderRequestDto;
import com.preOrder.canteen.entity.Food;
import com.preOrder.canteen.entity.Order;
import com.preOrder.canteen.entity.OrderItem;
import com.preOrder.canteen.entity.User;
import com.preOrder.canteen.exception.BadRequestException;
import com.preOrder.canteen.exception.ResourceNotFoundException;
import com.preOrder.canteen.repository.FoodRepository;
import com.preOrder.canteen.repository.OrderRepository;
import com.preOrder.canteen.repository.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FoodRepository foodRepository;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        FoodRepository foodRepository) {

        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.foodRepository = foodRepository;
    }

    @Transactional
    public Order placeOrder(OrderRequestDto request) {
    	
    	

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = new Order();

        order.setUser(user);
        order.setStatus("PLACED");
        order.setOrderDate(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequestDto itemDto : request.getItems()) {

            Food food = foodRepository.findById(itemDto.getFoodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food not found"));

            if (!food.isAvailable()) {
                throw new BadRequestException(food.getName() + " is not available");
            }

            if (itemDto.getQuantity() <= 0) {
                throw new BadRequestException("Quantity must be greater than 0");
            }

            OrderItem item = new OrderItem();

            item.setOrder(order);
            item.setFood(food);
            item.setQuantity(itemDto.getQuantity());
            item.setPrice(food.getPrice());

            order.getItems().add(item);

            BigDecimal itemTotal = food.getPrice()
                    .multiply(BigDecimal.valueOf(itemDto.getQuantity()));

            total = total.add(itemTotal);
        }

        order.setTotalAmount(total);

        return orderRepository.save(order);
    }
    public List<Order> getAllOrders(String status) {
        if (status == null || status.isBlank()) {
            return orderRepository.findAllByOrderByOrderDateDesc();
        }
        String s = status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(s)) {
            throw new BadRequestException("Invalid status: " + status);
        }
        return orderRepository.findByStatusOrderByOrderDateAsc(s);
    }
    
    private static final Set<String> VALID_STATUSES =
            Set.of("PLACED", "PREPARING", "READY", "COMPLETED", "CANCELLED");

    public List<Order> getOrdersByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        return orderRepository.findByUserId(userId);
    }

    @Transactional
    public Order updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        String newStatus = status == null ? "" : status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BadRequestException("Invalid status: " + status);
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
    
}
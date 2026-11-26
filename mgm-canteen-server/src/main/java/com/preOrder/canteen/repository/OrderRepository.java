package com.preOrder.canteen.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.preOrder.canteen.entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
	List<Order> findByUserId(Long userId);
	List<Order> findAllByOrderByOrderDateDesc();
	List<Order> findByStatusOrderByOrderDateAsc(String status);
}

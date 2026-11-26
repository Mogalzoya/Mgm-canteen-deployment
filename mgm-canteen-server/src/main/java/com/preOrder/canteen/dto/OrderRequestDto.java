package com.preOrder.canteen.dto;

import java.util.List;

public class OrderRequestDto {

    private Long userId;
    private List<OrderItemRequestDto> items;

    

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<OrderItemRequestDto> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequestDto> items) {
        this.items = items;
    }

	public Long getUserId() {
		
		return userId;	}
}
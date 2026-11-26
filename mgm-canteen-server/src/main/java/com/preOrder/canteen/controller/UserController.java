package com.preOrder.canteen.controller;

import java.util.List;

import org.apache.coyote.BadRequestException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.preOrder.canteen.dto.UserRequestDto;
import com.preOrder.canteen.dto.UserResponseDto;
import com.preOrder.canteen.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/user")
public class UserController {
	
	private final UserService userService ;
	
	public UserController(UserService userService) {
		this.userService = userService ;
	}
	
	@PostMapping
	public UserResponseDto addUser( @Valid @RequestBody UserRequestDto userRequestDto) throws BadRequestException {
	    return userService.addUser(userRequestDto);
	}
	
	@GetMapping
	public List<UserResponseDto> getAll(){
		return userService.getAllUser() ;
	}
	
		

}

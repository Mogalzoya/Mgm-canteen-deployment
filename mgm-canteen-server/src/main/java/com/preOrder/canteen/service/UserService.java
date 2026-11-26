package com.preOrder.canteen.service;

import java.util.List;


import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.preOrder.canteen.dto.UserRequestDto;
import com.preOrder.canteen.dto.UserResponseDto;
import com.preOrder.canteen.entity.User;
import com.preOrder.canteen.exception.BadRequestException;
import com.preOrder.canteen.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
     private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


      public UserResponseDto addUser(UserRequestDto request)  {
    	  
    	 if (userRepository.existsByEmail(request.getEmail())) {
             throw new BadRequestException("Email already registered");
         }

        // DTO → Entity
        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
               
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        user.setPhone(request.getPhone());

        // Save Entity
        User savedUser = userRepository.save(user);

        // Entity → DTO
        UserResponseDto response = new UserResponseDto();
        
        response.setId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setName(savedUser.getName());
        response.setPhone(savedUser.getPhone());

        return response;
    }

    public List<UserResponseDto> getAllUser() {

        List<User> users = userRepository.findAll();

        return users.stream()
                .map(user -> {

                    UserResponseDto response = new UserResponseDto();

                    response.setName(user.getName());
                    response.setPhone(user.getPhone());

                    return response;

                })
                .toList();
    }
}
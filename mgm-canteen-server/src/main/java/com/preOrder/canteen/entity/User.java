package com.preOrder.canteen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
public class User {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY )
	private Long id ;
	
	@NotBlank(message = "Name is required")
	private String name ;
	
	@Column(nullable = false)
	private String password ;

	
	@Column(unique = true, nullable = false)
	private String email ;
	
	@NotBlank(message = " phone no. is required")
	@Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number must be a valid 10-digit number")
	private String phone ;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role = Role.STUDENT;
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	
	public String getEmail() {
		return email;
	}
	

	public void setEmail(String email) {
		this.email = email;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Role getRole() {
	    return role;
	}

	public void setRole(Role role) {
	    this.role = role;
	}

}

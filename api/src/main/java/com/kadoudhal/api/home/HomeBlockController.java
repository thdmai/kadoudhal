package com.kadoudhal.api.home;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home-blocks")
public class HomeBlockController {

	private final HomeBlockRepository repository;

	public HomeBlockController(HomeBlockRepository repository) {
		this.repository = repository;
	}

	@GetMapping
	public List<HomeBlockResponse> list() {
		return repository.findByDeletedAtIsNullOrderBySortOrderAsc().stream()
				.map(HomeBlockResponse::from)
				.toList();
	}
}

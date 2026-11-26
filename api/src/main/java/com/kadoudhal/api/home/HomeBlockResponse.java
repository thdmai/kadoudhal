package com.kadoudhal.api.home;

public record HomeBlockResponse(
		String slug,
		String title,
		String title_ar,
		String excerpt,
		String image_url) {

	static HomeBlockResponse from(HomeBlockEntity entity) {
		return new HomeBlockResponse(
				entity.getSlug(),
				entity.getTitle(),
				entity.getTitleAr(),
				entity.getExcerpt(),
				entity.getImageUrl());
	}
}

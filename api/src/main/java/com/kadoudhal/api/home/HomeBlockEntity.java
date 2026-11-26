package com.kadoudhal.api.home;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "home_blocks")
public class HomeBlockEntity {

	@Id
	private UUID id;

	@Column(nullable = false, unique = true)
	private String slug;

	@Column(nullable = false)
	private String title;

	@Column(name = "title_ar", nullable = false)
	private String titleAr = "";

	@Column(nullable = false)
	private String excerpt = "";

	@Column(name = "image_url", nullable = false)
	private String imageUrl = "";

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;

	@Column(name = "deleted_at")
	private Instant deletedAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	public UUID getId() {
		return id;
	}

	public String getSlug() {
		return slug;
	}

	public String getTitle() {
		return title;
	}

	public String getTitleAr() {
		return titleAr;
	}

	public String getExcerpt() {
		return excerpt;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public Instant getDeletedAt() {
		return deletedAt;
	}
}

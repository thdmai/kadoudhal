package com.kadoudhal.api.home;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeBlockRepository extends JpaRepository<HomeBlockEntity, UUID> {

	List<HomeBlockEntity> findByDeletedAtIsNullOrderBySortOrderAsc();
}

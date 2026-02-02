package com.example.fleet.domain.repository;

import com.example.fleet.domain.model.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {

    List<Vehicle> findByBusCompanyId(Integer companyId);

    @Query("SELECT v FROM Vehicle v WHERE " +
            "(:search IS NULL OR :search = '' OR v.name LIKE CONCAT('%', :search, '%'))")
    Page<Vehicle> findAllByPagination(Pageable pageable, @Param("search") String search);

    @Query("SELECT v FROM Vehicle v WHERE v.busCompany.id = :companyId AND " +
            "(:search IS NULL OR :search = '' OR v.name LIKE CONCAT('%', :search, '%'))")
    Page<Vehicle> findByCompanyIdWithPagination(
            Pageable pageable,
            @Param("companyId") Integer companyId,
            @Param("search") String search);
}

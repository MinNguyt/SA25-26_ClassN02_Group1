package com.example.fleet.presentation.controller;

import com.example.fleet.application.BusCompanyService;
import com.example.fleet.presentation.dto.buscompany.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
@Tag(name = "Bus Companies", description = "Bus company management endpoints")
public class BusCompanyController {

    private final BusCompanyService busCompanyService;

    @GetMapping
    @Operation(summary = "Get all bus companies with pagination")
    public ResponseEntity<Page<BusCompanyResponseDTO>> getAllCompanies(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search) {

        BusCompanyQueryDTO query = BusCompanyQueryDTO.builder()
                .page(page)
                .limit(limit)
                .search(search)
                .build();

        return ResponseEntity.ok(busCompanyService.getAllCompanies(query));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bus company by ID")
    public ResponseEntity<BusCompanyResponseDTO> getCompanyById(@PathVariable Integer id) {
        return ResponseEntity.ok(busCompanyService.getCompanyById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new bus company")
    public ResponseEntity<BusCompanyResponseDTO> createCompany(
            @Valid @RequestPart("data") BusCompanyCreateDTO request,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(busCompanyService.createCompany(request, image));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update a bus company")
    public ResponseEntity<BusCompanyResponseDTO> updateCompany(
            @PathVariable Integer id,
            @Valid @RequestPart("data") BusCompanyUpdateDTO request,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        return ResponseEntity.ok(busCompanyService.updateCompany(id, request, image));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a bus company")
    public ResponseEntity<Void> deleteCompany(@PathVariable Integer id) {
        busCompanyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}

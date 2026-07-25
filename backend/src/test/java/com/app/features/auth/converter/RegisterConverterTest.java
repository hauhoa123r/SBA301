package com.app.features.auth.converter;

import com.app.features.auth.dto.request.RegisterRequest;
import com.app.features.auth.repository.RoleRepository;
import com.app.features.model.RoleEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.UserStatus;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RegisterConverterTest {

    @Test
    void registrationAlwaysAssignsOnlyStudentRole() {
        RoleRepository roleRepository = mock(RoleRepository.class);
        RoleEntity studentRole = new RoleEntity();
        studentRole.setId(4L);
        studentRole.setName("STUDENT");
        when(roleRepository.findByName("STUDENT")).thenReturn(Optional.of(studentRole));
        RegisterConverter converter = new RegisterConverter(roleRepository);

        UserEntity user = converter.convert(new RegisterRequest(
                "  Student User  ",
                "  Student@Example.COM  ",
                "Password1"
        ));

        assertEquals("Student User", user.getFullName());
        assertEquals("student@example.com", user.getEmail());
        assertEquals("Password1", user.getPasswordHash());
        assertEquals(UserStatus.PENDING, user.getStatus());
        assertEquals(0, user.getTotalLearningPoints());
        assertEquals(1, user.getRoles().size());
        assertSame(studentRole, user.getRoles().iterator().next());
        verify(roleRepository).findByName("STUDENT");
    }

    @Test
    void registrationRequestHasNoClientAssignableRoleField() {
        boolean hasRoleField = Arrays.stream(RegisterRequest.class.getDeclaredFields())
                .map(Field::getName)
                .anyMatch(name -> name.equalsIgnoreCase("role") || name.equalsIgnoreCase("roles"));

        assertFalse(hasRoleField);
    }
}

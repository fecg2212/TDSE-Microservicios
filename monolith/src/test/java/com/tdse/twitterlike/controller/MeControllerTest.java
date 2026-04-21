package com.tdse.twitterlike.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void meShouldRequireReadProfileScope() throws Exception {
        mockMvc.perform(get("/api/me")
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .jwt(jwt -> jwt.claim("scope", "read:posts"))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/me")
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .jwt(jwt -> jwt.claim("scope", "read:profile"))))
                .andExpect(status().isOk());
    }
}

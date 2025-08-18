package com.example.session;

import java.io.Serializable;
import java.time.Instant;
import java.util.Set;

public record ServerSession(
        Integer userId,
        Set<String> roles,
        int sessionVersion,
        String refreshId,
        Instant refreshExpiry
) implements Serializable {
    private static final long serialVersionUID = 1L;
}

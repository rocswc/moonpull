package com.example.service;

import com.example.dto.SocialLinkDTO;
import com.example.dto.SocialLinkResponse;

public interface SocialLinkService {
    SocialLinkResponse link(SocialLinkDTO dto);
}

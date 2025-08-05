package com.example.dto;

import lombok.Data;

@Data
public class MyMentorListDTO {
    private int mentoring_progress_id;
    private int mentor_id;
    private String mentor_name;
    private Integer chat_id;
    private String connection_status;
    private String start_date;
    private String end_date;
}

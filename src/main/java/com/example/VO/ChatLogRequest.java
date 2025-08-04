package com.example.VO;

import java.util.Date;

import lombok.Data;

@Data
public class ChatLogRequest {
	 private String senderId; 
	 //
	    private String content;
	    private String roomId;
	    private String type;
	    private boolean abusive;
	    private Date timestamp;
}

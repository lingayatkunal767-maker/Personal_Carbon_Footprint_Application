package com.carboncalc.app.dto.notification;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkReadResponse {

    private String message;
}
package com.app.publishDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public abstract class AbstractPagingDTO {
    protected int page = 0;
    protected int size = 10;
}

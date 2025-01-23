package com.zzxy.elderlycare.service;

import com.zzxy.elderlycare.entity.Activity;

import java.time.LocalDate;
import java.util.List;

public interface ActivityService {
    List<Activity> recentItems();

    List<Activity> status(String currentStatus);

    Activity getById(Integer id);

    void addActivity(Activity activity);

    void deleteActivity(Integer id);

    List<Activity> range(LocalDate start, LocalDate end);

    int getByElderlyId(Integer id);

    void joinActivity(Integer id);
}

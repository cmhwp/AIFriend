package model

import (
	"time"

	"gorm.io/gorm"
)

type Character struct {
	Id              int64          `gorm:"primaryKey;autoIncrement" json:"id"`
	UserId          int64          `gorm:"index;not null" json:"user_id"`
	Name            string         `gorm:"size:50;not null" json:"name"`
	Photo           string         `gorm:"size:255" json:"photo"`
	Profile         string         `gorm:"type:text" json:"profile"`
	BackgroundImage string         `gorm:"size:255" json:"background_image"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Character) TableName() string {
	return "characters"
}

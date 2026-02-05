// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package svc

import (
	"aifriend/internal/config"
	"aifriend/internal/model"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type ServiceContext struct {
	Config config.Config
	DB     *gorm.DB
}

func NewServiceContext(c config.Config) *ServiceContext {
	// 连接数据库
	db, err := gorm.Open(mysql.Open(c.MySQL.DataSource), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// 自动迁移
	if err := db.AutoMigrate(&model.User{}, &model.Character{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	return &ServiceContext{
		Config: c,
		DB:     db,
	}
}

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Изменяем тип колонки role в таблице Users
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'superadmin'),
      defaultValue: 'admin',
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Возвращаем предыдущий тип колонки role
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
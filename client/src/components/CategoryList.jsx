import React from 'react';
import CategoryItem from './CategoryItem';

/**
 * Компонент списка категорий
 * @param {Array} categories - Массив категорий для отображения
 * @param {Function} onEdit - Функция для редактирования категории
 * @param {Function} onDelete - Функция для удаления категории
 */
function CategoryList({ categories, onEdit, onDelete }) {
  // Отображаем сообщение, если категории не найдены
  if (categories.length === 0) {
    return <div className="no-categories">Категории не найдены</div>;
  }

  return (
    <div className="category-list">
      <div className="category-items">
        {categories.map(category => (
          <div key={category.id} className="category-item-wrapper">
            <CategoryItem
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryList;
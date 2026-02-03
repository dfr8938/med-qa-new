import React, { useState, useEffect } from 'react';
import CategoryList from './CategoryList';

function CategorySection({ 
  categories, 
  displayedCategories, 
  currentCategoryPage, 
  totalCategoryPages,
  onCategoryEdit,
  onCategoryDelete,
  onPageChange
}) {
  return (
    <div className="category-management">
      <div className="category-list-section">
        <h4>Список категорий</h4>
        <CategoryList
          categories={displayedCategories}
          onEdit={onCategoryEdit}
          onDelete={onCategoryDelete}
        />
        {/* Пагинация категорий */}
        <div className="category-pagination">
          <button
            onClick={() => onPageChange(currentCategoryPage - 1)}
            disabled={currentCategoryPage === 1}
            className="pagination-button"
            title="Предыдущая страница"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          {totalCategoryPages > 1 && (
            <div className="page-input-container">
              <label>Страница:</label>
              <input
                type="number"
                min="1"
                max={totalCategoryPages}
                value={currentCategoryPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalCategoryPages) {
                    onPageChange(page);
                  }
                }}
                className="page-input"
              />
              <span>из {totalCategoryPages}</span>
            </div>
          )}
          
          <button
            onClick={() => onPageChange(currentCategoryPage + 1)}
            disabled={currentCategoryPage === totalCategoryPages}
            className="pagination-button"
            title="Следующая страница"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategorySection;
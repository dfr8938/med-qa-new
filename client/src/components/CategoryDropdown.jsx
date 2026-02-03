import React from 'react';

function CategoryDropdown({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div className="category-dropdown">
      <select
        id="category-select"
        value={selectedCategory ? selectedCategory.id : ''}
        onChange={(e) => {
          const categoryId = e.target.value;
          const category = categories.find(cat => cat.id === parseInt(categoryId));
          onCategoryChange(category || null);
        }}
        className="category-select"
      >
        <option value="">Все категории</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CategoryDropdown;
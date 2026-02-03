import React from 'react';


function CategoryItem({ category, onEdit, onDelete }) {
  return (
    <div className="category-item">
      <div className="category-content">
        <h4>{category.name}</h4>
        {category.description && (
          <p className="category-description">{category.description}</p>
        )}
      </div>
      <div className="category-footer">
        <div className="category-meta">
          <span className="date">{new Date(category.createdAt).toLocaleDateString('ru-RU')}</span>
          <span className="category-tag">
            ID: {category.id}
          </span>
        </div>
        <div className="category-actions">
          <button
            className="btn btn-edit"
            onClick={() => onEdit(category)}
            title="Редактировать"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onDelete(category)}
            title="Удалить"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryItem;
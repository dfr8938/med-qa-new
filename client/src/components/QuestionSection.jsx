import React from 'react';
import QuestionList from './QuestionList';

function QuestionSection({ 
  questions, 
  onEdit, 
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}) {
  return (
    <div className="list-section">
      <h3>Список вопросов</h3>
      <QuestionList
        questions={questions}
        onEdit={onEdit}
        onDelete={(id, questionText) => onDelete(id, questionText)}
      />
      {/* Пагинация */}
      <div className="pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
          title="Предыдущая страница"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        
        {totalPages > 1 && (
          <div className="page-input-container">
            <label>Страница:</label>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  onPageChange(page);
                }
              }}
              className="page-input"
            />
            <span>из {totalPages}</span>
          </div>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
          title="Следующая страница"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

export default QuestionSection;
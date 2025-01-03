import React, { useState, useEffect } from "react";
import axios from "../api/axios";

const AccountMenuComponent = ({ menuData }) => {
  const [error, setError] = useState(null);

  return (
    <div>
      {/* Отображение ошибки */}
      {error && <p className="error">{error}</p>}

      {/* Отображение контента */}
      <div>
          {/* Навигационная часть */}

      </div>
    </div>
  );
};

export default AccountMenuComponent;
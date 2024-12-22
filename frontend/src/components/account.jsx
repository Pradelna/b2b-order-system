import React from "react";

function Account({ language, languageData }) {
    const currentData = languageData.find(item => item.lang === language);
    const data = currentData['service'];
  if (!data) {
    return null; // Если данных нет, компонент ничего не отображает
  }

  return (
        <div className="container margin-top-200">
            <div className="row">
              <div className="col-8">
                <div id="company-top" className="row">
                  
                  <div className="col-6">
                    <div className="card dashboard">
                      <div className="card-body">
                        <h5 className="card-title">Company name</h5>
                        <h6 className="card-subtitle mb-2 text-body-secondary">ICO 44502693</h6>
                        <p className="card-text">+420 944 764 873</p>
                        <p className="card-text">hotel@gmail.com</p>
                        <p className="card-text">Petr Kucer</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-3">
                    <div className="card dashboard-button">
                      <div className="card-body">
                        <h5 className="card-title">Orders history</h5>
                        <h6 className="card-subtitle mb-2 text-body-secondary">View order history</h6>
                        <p className="card-text">Some text</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-3">
                    
                    <div className="card dashboard-button mini new-order">
                      <div className="card-body">
                        <h5 className="card-title">new order</h5>
                      </div>
                    </div>
                    
                    <div className="card dashboard-button mini">
                      <div className="card-body">
                        <h5 className="card-title">new place</h5>
                      </div>
                    </div>
                    
                  </div>

                </div>
                
          
                <div className="row mt-5">
                  
                  <div className="col-12">
                    
                    <div className="card dashboard place-card">
                      <div className="card-body place">
                        <img src="src/assets/dom.webp" alt="" />
                        <h5 className="card-title">Hotel Praha</h5>
                        <p className="card-text">Sokolovska 15, 831 43</p>
                        <button className="call dash-button">new order</button>
                      </div>
                    </div>
                    
                  </div>
                  
                  <div className="col-12">
                    
                    <div className="card dashboard place-card">
                      <div className="card-body place">
                        <img src="src/assets/dom.webp" alt="" />
                        <h5 className="card-title">Hotel Praha</h5>
                        <p className="card-text">Sokolovska 15, 831 43</p>
                        <button className="call dash-button">new order</button>
                      </div>
                    </div>
                    
                  </div>
                  
                  <div className="col-12">
                    
                    <div className="card dashboard place-card">
                      <div className="card-body place">
                        <img src="src/assets/dom.webp" alt="" />
                        <h5 className="card-title">Hotel Praha</h5>
                        <p className="card-text">Sokolovska 15, 831 43</p>
                        <button className="call dash-button">new order</button>
                      </div>
                    </div>
                    
                  </div>

                </div>
                
          
          


              </div>

            </div>

        </div>
  );
}

export default Account;
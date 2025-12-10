import numpy as np
import pandas as pd
 
import seaborn as sns
import matplotlib.pyplot as plt
import pickle
from sklearn.model_selection import train_test_split
import xgboost as xgb
from xgboost import plot_tree

from sklearn.metrics import mean_squared_error, r2_score

df = pd.read_csv(r"DO_5DayAverage.csv", header=0)
X = df.loc[:, df.columns!="DO_output"]
y = df["DO_output"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=1)

xgb_regression = xgb.XGBRegressor(max_depth=5, n_estimators=1000, max_delta_step=4.5, min_child_weight=2.5, gamma=1, learning_rate=0.2, n_jobs=-1)
xgb_regression.fit(X_train, y_train)

y_pred = xgb_regression.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f'RMSE: {rmse:.3f}')
print(f'R²: {r2:.3f}')

plot_tree(xgb_regression)
plt.show()

pickle.dump(xgb_regression, open('DO.sav', 'wb'))



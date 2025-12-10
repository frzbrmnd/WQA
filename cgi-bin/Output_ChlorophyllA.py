#!/home/frzbrmnd/anaconda3/bin/python
# -*- coding: UTF-8 -*-

print("Content-Type: text/html\n\r\n")
print()


import numpy as np
import pandas as pd
import pickle


xgb_regression = pickle.load(open('CHFL_A.sav', 'rb'))

def prediction_model(Temp_1, PO4_1, NH4_1, NO3_1, CBOD_1, alga_1, DO_1, Temp_2, PO4_2, NH4_2, NO3_2, CBOD_2, alga_2, DO_2, TAIR, WIND, Q_out, Elevation):
    row = [Temp_1, PO4_1, NH4_1, NO3_1, CBOD_1, alga_1, DO_1, Temp_2, PO4_2, NH4_2, NO3_2, CBOD_2, alga_2, DO_2, TAIR, WIND, Q_out, Elevation]
    x = pd.DataFrame([row])
    x.columns =["Temp_1", "PO4_1", "NH4_1", "NO3_1", "CBOD_1", "alga_1", "DO_1", "Temp_2", "PO4_2", "NH4_2", "NO3_2", "CBOD_2", "alga_2", "DO_2", "TAIR", "WIND", "Q_out", "Elevation"]
    predictions = xgb_regression.predict(x)
    return(predictions)


import string
import cgi, cgitb
import json
cgitb.enable()

data = cgi.FieldStorage()

inputs = data.getvalue("inputs").split("],[")
days = []
for day in inputs:
    days.append(day.replace("[", "").replace("]", "").split(","))


totalAverageData = []

if(len(days)%5 != 0):
    print("Invalid inputs. you need to enter data for 5 days or multiple of 5 days")
else: 
    for i in range(int(len(days)/5)):
        average5day = []
        for j in range(1,8):
            average5day.append(np.mean([float(days[i*5][0])*float(days[i*5][j]), float(days[i*5+1][0])*float(days[i*5+1][j]), float(days[i*5+2][0])*float(days[i*5+2][j]), float(days[i*5+3][0])*float(days[i*5+3][j]), float(days[i*5+4][0])*float(days[i*5+4][j])]))
        
        for j in range(9,16):
            average5day.append(np.mean([float(days[i*5][8])*float(days[i*5][j]), float(days[i*5+1][8])*float(days[i*5+1][j]), float(days[i*5+2][8])*float(days[i*5+2][j]), float(days[i*5+3][8])*float(days[i*5+3][j]), float(days[i*5+4][8])*float(days[i*5+4][j])]))
        
        for j in range(16,20):
            average5day.append(np.mean([float(days[i*5][j]), float(days[i*5+1][j]), float(days[i*5+2][j]), float(days[i*5+3][j]), float(days[i*5+4][j])]))
        
        totalAverageData.append(average5day)

results=[]
for i in range(len(totalAverageData)):
    res = prediction_model(totalAverageData[i][0], totalAverageData[i][1], totalAverageData[i][2], totalAverageData[i][3], totalAverageData[i][4], totalAverageData[i][5], totalAverageData[i][6], totalAverageData[i][7], totalAverageData[i][8], totalAverageData[i][9], totalAverageData[i][10], totalAverageData[i][11], totalAverageData[i][12], totalAverageData[i][13], totalAverageData[i][14
], totalAverageData[i][15], totalAverageData[i][16], totalAverageData[i][17])
    results.append(res[0])

json_string = json.dumps(str(results))
print(results)
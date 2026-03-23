import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Sample dataset
data = {
    "aqi":[50,80,120,160,200,250,300,90,110,170],
    "temperature":[20,25,30,35,40,38,36,22,28,34],
    "humidity":[40,50,60,65,70,75,80,55,58,68],
    "age":[10,15,25,40,65,70,30,20,50,60],
    "health":[0,0,1,1,2,2,0,1,2,2],
    "risk":[0,0,1,1,2,2,1,0,1,2]
}

df = pd.DataFrame(data)

X = df.drop("risk",axis=1)
y = df["risk"]

model = RandomForestClassifier()
model.fit(X,y)

joblib.dump(model,"aqi_model.pkl")

print("Model trained and saved successfully")
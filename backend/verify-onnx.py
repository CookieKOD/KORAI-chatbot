import onnx

model_onnx = onnx.load(r"C:\Users\DonutGiveUp\Documents\DICENTRE4AI\KORAI\Version2\Latest-Version\korai-app\frontend\assets\efficientnet.onnx")
onnx.checker.check_model(model_onnx)
print("Le fichier ONNX est valide !")
# utils/mistral_client.py
import os
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()
mistral_client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
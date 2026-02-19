import json
import datetime
import os

# Hindi Text (Existing)
text_hi = """
अध्याय 1
**नाम, मंगलाचरण एवं आधिकारिक पहचान**

**1.1 समिति का नाम**
इस समिति का आधिकारिक नाम होगा:
**“ माँ जगदम्बा स्वयंसेवी सहायता समिति, सतघरा ”**

**1.2 मंगलाचरण**
**मङ्गलम् भगवान विष्णुः, मङ्गलम् गरुणध्वजः।**
**मङ्गलम् पुण्डरीकाक्षः, मङ्गलाय तनो हरिः॥**

**1.3 समिति की प्रकृति**
यह समिति समान सेवा, सहयोग एवं मानवीय भावना रखने वाले व्यक्तियों का एक स्वैच्छिक पारिवारिक समूह है।

---

अध्याय 2
**प्रस्तावना एवं स्थापना का उद्देश्य**

**2.1 प्रस्तावना**
मानव समाज परस्पर सहयोग पर आधारित है। संकट की घड़ी में कोई अकेला न रहे, यही हमारा उद्देश्य है।

**2.2 स्थापना की आवश्यकता**
व्यक्तिगत सहायता सीमित होती है, जबकि सामूहिक सहयोग अधिक प्रभावी और स्थायी होता है।

---

अध्याय 3
**पंजीकृत कार्यालय एवं कार्यक्षेत्र**

**3.1 पंजीकृत कार्यालय**
ग्राम: सतघरा, पोस्ट: सतघरा, थाना: बाबूबरही, जिला: मधुबनी, बिहार।

**3.2 कार्यक्षेत्र**
मुख्यतः सतघरा ग्राम एवं निकटवर्ती टोले/मोहल्ले।

---

अध्याय 4
**समिति के उद्देश्य**

**4.1 आपातकालीन आर्थिक सहायता**
बीमारी, दुर्घटना, मृत्यु या आपदा के समय सहयोग।

**4.2 शिक्षा सहयोग**
मेधावी और जरूरतमंद छात्रों को सहायता।

---

अध्याय 5
**लाभ-रहित स्वरूप एवं मूल सिद्धांत**

**5.1 लाभ-रहित (Non-Profit)**
समिति का उद्देश्य लाभ कमाना नहीं, बल्कि सेवा करना है।

**5.2 स्वैच्छिक सहयोग**
सहयोग पूर्णतः स्वैच्छिक है, कोई बाध्यता नहीं।

---

अध्याय 6
**सदस्यता संबंधी नियम**

**6.1 पारिवारिक सदस्यता**
प्रत्येक परिवार से एक 'पारिवारिक मुखिया' सदस्य होगा।

**6.2 आश्रित सदस्य**
माता-पिता, पत्नी, अविवाहित बच्चे आश्रित माने जाएंगे।

---

अध्याय 7
**सदस्यों के अधिकार एवं कर्तव्य**

**7.1 अधिकार**
बैठक में भाग लेने, सुझाव देने और सहायता मांगने का अधिकार।

**7.2 कर्तव्य**
नियमों का पालन और सहयोग की भावना बनाए रखना।

---

अध्याय 8
**योगदान (सहयोग राशि)**

**8.1 नो फिक्स्ड फी**
कोई मासिक चंदा नहीं। केवल आवश्यकता पड़ने पर सहयोग।

**8.2 पारदर्शिता**
सभी योगदान का हिसाब पारदर्शी रखा जाएगा।

---

अध्याय 9
**सहायता प्रक्रिया**

**9.1 अनुरोध**
सदस्य विपत्ति के समय आवेदन कर सकते हैं।

**9.2 सत्यापन**
कार्यकारिणी मामले की जाँच करेगी और सहायता राशि तय करेगी।

---

अध्याय 10
**धन प्रबंधन**

**10.1 बैंक खाता**
संयुक्त खाता (कोषाध्यक्ष + अध्यक्ष/सचिव) द्वारा संचालित।

**10.2 उपयोग**
केवल स्वीकृत कार्यों के लिए धन का उपयोग।

---

अध्याय 11
**प्रबंध कार्यकारिणी**

**11.1 संरचना**
अध्यक्ष, उपाध्यक्ष, सचिव, कोषाध्यक्ष और सदस्य।

**11.2 चयन**
आम सहमति या बहुमत से चयन।

---

अध्याय 12
**पदाधिकारियों के कर्तव्य**

**12.1 अध्यक्ष**
समग्र नेतृत्व और बैठकों की अध्यक्षता।

**12.2 सचिव**
रिकॉर्ड रखना और संवाद करना।

---

अध्याय 13
**बैठकें**

**13.1 साधारण सभा**
वर्ष में कम से कम एक बार।

**13.2 आपात बैठक**
विशेष परिस्थिति में 24 घंटे की सूचना पर।

---

अध्याय 14
**लेखा एवं अभिलेख**

**14.1 रिकॉर्ड कीपिंग**
सदस्य रजिस्टर, आय-व्यय रजिस्टर, और बैठक मिनट बुक।

---

अध्याय 15
**ऑडिट**

**15.1 वार्षिक ऑडिट**
पारदर्शिता के लिए आंतरिक या बाहरी ऑडिट।

---

अध्याय 16
**अनुशासन**

**16.1 कार्यवाही**
समिति विरोधी गतिविधियों पर सदस्यता समाप्त की जा सकती है।

---

अध्याय 17
**संशोधन**

**17.1 प्रक्रिया**
2/3 बहुमत से नियमों में बदलाव संभव।

---

अध्याय 18
**विघटन**

**18.1 प्रक्रिया**
विशेष बैठक में निर्णय। संपत्ति किसी अन्य धर्मार्थ संस्था को दी जाएगी।

---

अध्याय 19
**विधिक अनुपालन**

**19.1 कानून**
भारतीय कानूनों और सामाजिक मर्यादा का पालन अनिवार्य।

---

अध्याय 20
**घोषणा**

**20.1 शपथ**
हम सभी सदस्य इन नियमों का पालन करने की शपथ लेते हैं।
"""

# English Text (New)
text_en = """
Chapter 1
**Name, Invocation & Official Identity**

**1.1 Name of Society**
The official name shall be:
**"Maa Jagdamba Voluntary Help Society, Satghara"**

**1.2 Invocation**
**Mangalam Bhagwan Vishnu, Mangalam Garudadhwaja.**
(May Lord Vishnu bless our endeavors.)

**1.3 Nature of Society**
This is a voluntary family group based on mutual cooperation, service, and humanitarian values.

---

Chapter 2
**Preamble & Purpose**

**2.1 Preamble**
Human society is built on mutual support. Our goal is to ensure no member feels alone in times of crisis.

**2.2 Necessity**
Collective support is more effective and sustainable than individual help.

---

Chapter 3
**Registered Office & Jurisdiction**

**3.1 Office Address**
Village: Satghara, Post: Satghara, PS: Babubarhi, District: Madhubani, Bihar.

**3.2 Jurisdiction**
Primarily Satghara village and nearby hamlets.

---

Chapter 4
**Objectives**

**4.1 Emergency Financial Aid**
Support during illness, accidents, death, or natural disasters.

**4.2 Education Support**
Help for meritorious and needy students.

---

Chapter 5
**Non-Profit & Core Principles**

**5.1 Non-Profit**
The goal is service, not profit generation.

**5.2 Voluntary Spirit**
Contributions are entirely voluntary; there is no coercion.

---

Chapter 6
**Membership Rules**

**6.1 Family Membership**
One 'Family Head' represents the family unit.

**6.2 Dependents**
Parents, spouse, and unmarried children are considered dependent members.

---

Chapter 7
**Rights & Duties**

**7.1 Rights**
Right to participate in meetings, give suggestions, and seek help.

**7.2 Duties**
To follow rules and maintain the spirit of cooperation.

---

Chapter 8
**Contribution (Donations)**

**8.1 No Fixed Fee**
No mandatory monthly subscription. Contributions are need-based.

**8.2 Transparency**
All financial records will be transparently maintained.

---

Chapter 9
**Help Process**

**9.1 Request**
Members can apply for help during emergencies.

**9.2 Verification**
The committee will verify the situation and decide the aid amount.

---

Chapter 10
**Fund Management**

**10.1 Bank Account**
Operated jointly by Treasurer and President/Secretary.

**10.2 Usage**
Funds to be used strictly for approved purposes.

---

Chapter 11
**Managing Committee**

**11.1 Structure**
President, Vice-President, Secretary, Treasurer, and Executive Members.

**11.2 Selection**
By consensus or majority vote.

---

Chapter 12
**Duties of Office Bearers**

**12.1 President**
Overall leadership and presiding over meetings.

**12.2 Secretary**
Record keeping and communication.

---

Chapter 13
**Meetings**

**13.1 General Assembly**
At least once a year.

**13.2 Emergency Meeting**
Called on short notice for urgent matters.

---

Chapter 14
**Records & Accounts**

**14.1 Record Keeping**
Membership register, Income-Expense register, and Minutes book.

---

Chapter 15
**Audit**

**15.1 Annual Audit**
Internal or external audit to ensure transparency.

---

Chapter 16
**Discipline**

**16.1 Action**
Membership can be terminated for anti-society activities.

---

Chapter 17
**Amendments**

**17.1 Process**
Rules can be amended by a 2/3rd majority.

---

Chapter 18
**Dissolution**

**18.1 Process**
Decision in a special meeting. Assets to be donated to a similar charity.

---

Chapter 19
**Legal Compliance**

**19.1 Laws**
Adherence to Indian laws and social norms is mandatory.

---

Chapter 20
**Declaration**

**20.1 Pledge**
We, the members, pledge to abide by these rules and regulations.
"""

data = {
    "current": {
        "text_hi": text_hi,
        "text_en": text_en,
        "updated_at": datetime.datetime.now().isoformat()
    },
    "history": []
}

os.makedirs("backend/data", exist_ok=True)

with open("backend/data/rules.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("Bilingual Rules updated successfully.")

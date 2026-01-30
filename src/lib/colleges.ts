export const COLLEGE_FALLBACK = [
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kharagpur",
  "IIT Kanpur",
  "IIT Roorkee",
  "IIT Guwahati",
  "IIT Hyderabad",
  "NIT Trichy",
  "NIT Surathkal",
  "NIT Warangal",
  "BITS Pilani",
  "BITS Goa",
  "BITS Hyderabad",
  "Delhi Technological University",
  "Jadavpur University",
  "VIT Vellore",
  "SRM Institute of Science and Technology",
  "Anna University",
  "Amity University",
  "Manipal Institute of Technology",
  "IISc Bengaluru",
  "IIIT Hyderabad",
  "IIIT Bangalore",
  "Jamia Millia Islamia",
  "Aligarh Muslim University",
  "Banaras Hindu University",
  "University of Delhi",
  "Christ University",
  "Savitribai Phule Pune University",
  "Birla Institute of Technology Mesra",
  "Dayananda Sagar College of Engineering",
];

export const filterColleges = (query: string, limit = 8) => {
  const normalized = query.toLowerCase();
  return COLLEGE_FALLBACK.filter((name) => name.toLowerCase().includes(normalized)).slice(0, limit);
};

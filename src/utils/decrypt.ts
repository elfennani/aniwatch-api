const decrypt = (string: string) => {
  if (string == "01") return "9";
  if (string == "08") return "0";
  if (string == "05") return "=";
  if (string == "0a") return "2";
  if (string == "0b") return "3";
  if (string == "0c") return "4";
  if (string == "07") return "?";
  if (string == "00") return "8";
  if (string == "5c") return "d";
  if (string == "0f") return "7";
  if (string == "5e") return "f";
  if (string == "17") return "/";
  if (string == "54") return "l";
  if (string == "09") return "1";
  if (string == "48") return "p";
  if (string == "4f") return "w";
  if (string == "0e") return "6";
  if (string == "5b") return "c";
  if (string == "5d") return "e";
  if (string == "0d") return "5";
  if (string == "53") return "k";
  if (string == "1e") return "&";
  if (string == "5a") return "b";
  if (string == "59") return "a";
  if (string == "4a") return "r";
  if (string == "4c") return "t";
  if (string == "4e") return "v";
  if (string == "57") return "o";
  if (string == "51") return "i";
  if (string == "50") return "h";
  if (string == "4b") return "s";
  if (string == "02") return ":";
  if (string == "55") return "m";
  if (string == "4d") return "u";
  if (string == "16") return ".";

  console.warn("MAP_FAIL", string)
  return string;
};

export default decrypt
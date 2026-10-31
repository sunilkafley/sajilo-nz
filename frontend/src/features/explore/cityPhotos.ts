import wellingtonPhoto from '../../assets/cities/wellington.jpg';
import hamiltonPhoto from '../../assets/cities/hamilton.jpg';
import christchurchPhoto from '../../assets/cities/christchurch.jpg';
import dunedinPhoto from '../../assets/cities/dunedin.jpg';
import aucklandPhoto from '../../assets/cities/auckland.jpg';

type CityPhoto = { photo:string; landmark:string; source:string; artist:string; license:string; licenseUrl:string };
export const cityPhotos: Record<string, CityPhoto> = {
  Wellington: { photo:wellingtonPhoto, landmark:"Wellington Cable Car at Lambton Quay", source:"https://commons.wikimedia.org/wiki/File:Wellington_Cable_Car_at_Lambton.jpg", artist:"Ulrich Lange, Bochum, Germany", license:"CC BY-SA 3.0", licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0" },
  Hamilton: { photo:hamiltonPhoto, landmark:"Italian Renaissance Garden at Hamilton Gardens", source:"https://commons.wikimedia.org/wiki/File:Hamilton_Gardens_-_Italian_Renaissance_Garden_in_summer.JPG", artist:"Hamiltongardens", license:"CC BY 3.0", licenseUrl:"https://creativecommons.org/licenses/by/3.0" },
  Christchurch: { photo:christchurchPhoto, landmark:"Christchurch tram at Cathedral Square", source:"https://commons.wikimedia.org/wiki/File:Christchurch_Tram_at_Cathedral_Square_01.jpg", artist:"Krzysztof Golik", license:"CC BY-SA 4.0", licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0" },
  Dunedin: { photo:dunedinPhoto, landmark:"Dunedin Railway Station", source:"https://commons.wikimedia.org/wiki/File:Dunedin_Railway_Station.jpg", artist:"User DLiebisch on de.wikipedia", license:"Public domain", licenseUrl:"https://commons.wikimedia.org/wiki/File:Dunedin_Railway_Station.jpg" },
  Auckland: { photo:aucklandPhoto, landmark:"Auckland skyline and Sky Tower at dusk", source:"https://commons.wikimedia.org/wiki/File:Auckland_city_skyline_at_dusk.jpg", artist:"Misaochan", license:"CC BY-SA 4.0", licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0" },
};

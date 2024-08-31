type ShopData = {
    radius: number;
    angle: number;
    shopName: string;
    shopDistance: string;
}

export const noodleshopdata: ShopData[] = [
    { radius: 0.5, angle: 0, shopName: "俺系塩ラーメン", shopDistance: "0.5km" },
    { radius: 0.3, angle: Math.PI / 2 + Math.PI / 6, shopName: "麺の先へ", shopDistance: "0.3km" },
    { radius: 0.4, angle: Math.PI, shopName: "Afuri", shopDistance: "0.4km" },
    { radius: 0.8, angle: Math.PI * 3 / 2, shopName: "はやし田", shopDistance: "0.8km" }
];

export const parkdata: ShopData[] = [
    { radius: 0.3, angle: 0, shopName: "筑紫の森公園", shopDistance: "0.3km" },
    { radius: 0.4, angle: Math.PI / 5, shopName: "林試の森公園", shopDistance: "0.4km" },
    { radius: 0.7, angle: Math.PI, shopName: "上野公園", shopDistance: "0.7km" },
    { radius: 0.8, angle: -Math.PI * 3 / 2, shopName: "NoNo青山", shopDistance: "0.8km" }
];

export const cafeData: ShopData[] = [
    { radius: 0.6, angle: 0, shopName: "スターバックス", shopDistance: "0.6km" },
    { radius: 0.4, angle: Math.PI / 4 + Math.PI / 3, shopName: "タリーズ", shopDistance: "0.2km" },
    { radius: 0.7, angle: -Math.PI / 3, shopName: "ドトール", shopDistance: "0.7km" },
    { radius: 0.3, angle: Math.PI + Math.PI / 4, shopName: "カフェベローチェ", shopDistance: "0.3km" },
    // { radius: 0.6, angle: -Math.PI / 9, shopName: "コメダ珈琲", shopDistance: "0.6km" }
];

export const conveniData: ShopData[] = [
    { radius: 0.5, angle: -Math.PI / 7, shopName: "セブンイレブン", shopDistance: "0.5km" },
    { radius: 0.2, angle: Math.PI / 2, shopName: "ローソン", shopDistance: "0.2km" },
    { radius: 0.7, angle: Math.PI + Math.PI / 8, shopName: "ファミリーマート", shopDistance: "0.7km" },
];